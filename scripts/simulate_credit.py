#!/usr/bin/env python3
import argparse
import sqlite3
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]
DEFAULT_DB = ROOT_DIR / "backend" / "seed" / "demo_credit.db"


def money(value):
    return f"ARS {int(round(value)):,}".replace(",", ".")


def pct(value):
    return f"{value:.1f}%"


def connect(db_path):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def list_hosts(conn):
    rows = conn.execute(
        """
        SELECT
          h.host_id,
          h.display_name,
          h.city,
          o.final_score,
          o.decision,
          o.recommended_advance_ars
        FROM credit_offers o
        JOIN hosts h ON h.host_id = o.host_id
        ORDER BY o.final_score DESC
        """
    ).fetchall()

    print("Hosts disponibles")
    print("-" * 110)
    for row in rows:
        print(
            f"{row['host_id']:<5} "
            f"{row['display_name']:<35} "
            f"{row['city']:<15} "
            f"score={row['final_score']:<5.1f} "
            f"{row['decision']:<10} "
            f"adelanto={money(row['recommended_advance_ars'])}"
        )


def show_host(conn, host_id):
    host = conn.execute(
        """
        SELECT h.*, m.destination_type, m.seasonality_index, m.demand_index
        FROM hosts h
        JOIN markets m ON m.city = h.city
        WHERE h.host_id = ?
        """,
        (host_id,),
    ).fetchone()
    if not host:
        raise SystemExit(f"No existe el host {host_id}")

    offer = conn.execute(
        "SELECT * FROM credit_offers WHERE host_id = ?",
        (host_id,),
    ).fetchone()

    print(f"{host['host_id']} - {host['display_name']}")
    print("-" * 80)
    print(f"Ciudad: {host['city']} ({host['destination_type']})")
    print(f"Antigüedad: {host['host_tenure_years']} años")
    print(f"Reservas completadas: {host['completed_bookings']}")
    print(f"Estacionalidad mercado: {host['seasonality_index']}")
    print(f"Demanda mercado: {host['demand_index']}/100")
    print()
    print("Scores por cluster")
    print("-" * 80)

    cluster_rows = conn.execute(
        """
        SELECT cw.display_name, cw.weight_pct, hcs.score, hcs.explanation
        FROM host_cluster_scores hcs
        JOIN cluster_weights cw ON cw.cluster_key = hcs.cluster_key
        WHERE hcs.host_id = ?
        ORDER BY cw.weight_pct DESC, cw.display_name
        """,
        (host_id,),
    ).fetchall()
    for row in cluster_rows:
        print(
            f"{row['display_name']:<28} "
            f"score={row['score']:<3} "
            f"peso={row['weight_pct']:.0f}% "
            f"{row['explanation']}"
        )

    print()
    print("Adelanto base")
    print("-" * 80)
    print(f"Decisión: {offer['decision']}")
    print(f"Score final: {offer['final_score']:.1f}")
    print(f"Adelanto pedido: {money(offer['requested_amount_ars'])}")
    print(f"Tope de adelanto: {money(offer['max_advance_ars'])}")
    print(f"Adelanto recomendado: {money(offer['recommended_advance_ars'])}")
    print(f"Retención: {pct(offer['holdback_pct'])}")
    print(f"Fee: {pct(offer['fee_pct'])}")
    print(f"Stress -30%: {offer['stress_down_30']}")
    print(f"Motivo: {offer['main_reason']}")


def estimate_repayment(conn, host_id, principal, fee_pct, holdback_pct, season_drop_pct):
    if principal <= 0:
        return 0, 0, False

    target = principal * (1 + fee_pct / 100)
    collected = 0
    months = set()

    rows = conn.execute(
        """
        SELECT payout_date, gross_value_ars, cancellation_risk_pct
        FROM future_bookings
        WHERE host_id = ?
        ORDER BY payout_date
        """,
        (host_id,),
    ).fetchall()

    for row in rows:
        adjusted_booking = row["gross_value_ars"]
        adjusted_booking *= 1 - row["cancellation_risk_pct"] / 100
        adjusted_booking *= 1 - season_drop_pct / 100
        collected += adjusted_booking * holdback_pct / 100
        months.add(row["payout_date"][:7])
        if collected >= target:
            return len(months), collected, True

    return max(len(months), 1), collected, collected >= target


def simulate(conn, host_id, requested_amount, season_drop_pct, holdback_pct, fee_pct):
    host = conn.execute(
        """
        SELECT h.host_id, h.display_name, h.city, o.*
        FROM hosts h
        JOIN credit_offers o ON o.host_id = h.host_id
        WHERE h.host_id = ?
        """,
        (host_id,),
    ).fetchone()
    if not host:
        raise SystemExit(f"No existe el host {host_id}")

    base_requested = requested_amount or host["requested_amount_ars"]
    base_holdback = holdback_pct if holdback_pct is not None else host["holdback_pct"]
    base_fee = fee_pct if fee_pct is not None else host["fee_pct"]

    adjusted_revenue = host["expected_future_revenue_p10_ars"] * (1 - season_drop_pct / 100)
    max_advance = adjusted_revenue * (base_holdback / 100) / (1 + base_fee / 100)
    recommended = max(0, min(base_requested, max_advance))

    if host["final_score"] < 50 or host["decision"] == "rejected":
        decision = "rechazado"
        recommended = 0
    elif recommended >= base_requested * 0.95:
        decision = "aprobado"
    elif recommended >= base_requested * 0.45:
        decision = "aprobación parcial"
    elif recommended > 0:
        decision = "línea piloto"
    else:
        decision = "rechazado"

    months, collected, fully_repaid = estimate_repayment(
        conn,
        host_id,
        recommended,
        base_fee,
        base_holdback,
        season_drop_pct,
    )

    print(f"Simulación para {host['display_name']} ({host['city']})")
    print("-" * 80)
    print(f"Score base: {host['final_score']:.1f}")
    print(f"Decisión simulada: {decision}")
    print(f"Caída de temporada: {pct(season_drop_pct)}")
    print(f"Ingreso futuro P10 base: {money(host['expected_future_revenue_p10_ars'])}")
    print(f"Ingreso futuro P10 ajustado: {money(adjusted_revenue)}")
    print(f"Adelanto pedido: {money(base_requested)}")
    print(f"Retención: {pct(base_holdback)}")
    print(f"Fee: {pct(base_fee)}")
    print(f"Tope de adelanto simulado: {money(max_advance)}")
    print(f"Adelanto recomendado simulado: {money(recommended)}")
    if recommended <= 0:
        print("Recuperación con reservas futuras: no aplica")
    else:
        print(f"Cobro estimado con reservas futuras: {money(collected)}")
        print(f"Meses observados para recuperación: {months}")
        print(f"Recuperación con reservas futuras: {'sí' if fully_repaid else 'no / requiere flujo adicional'}")


def main():
    parser = argparse.ArgumentParser(
        description="Simulador simple de adelanto estacional para anfitriones."
    )
    parser.add_argument("--db", default=str(DEFAULT_DB), help="Ruta a la base SQLite.")

    subparsers = parser.add_subparsers(dest="command", required=True)

    subparsers.add_parser("list", help="Listar hosts y adelantos base.")

    show_parser = subparsers.add_parser("show", help="Ver detalle de un host.")
    show_parser.add_argument("host_id")

    sim_parser = subparsers.add_parser("simulate", help="Simular un adelanto.")
    sim_parser.add_argument("host_id")
    sim_parser.add_argument("--requested", type=float, default=None, help="Adelanto pedido en ARS.")
    sim_parser.add_argument("--season-drop", type=float, default=30, help="Caída estimada de temporada en porcentaje.")
    sim_parser.add_argument("--holdback", type=float, default=None, help="Retención de cobros en porcentaje.")
    sim_parser.add_argument("--fee", type=float, default=None, help="Fee/costo del adelanto en porcentaje.")

    args = parser.parse_args()
    db_path = Path(args.db)
    if not db_path.exists():
        raise SystemExit(f"No existe la base {db_path}. Ejecuta ./scripts/build_demo_db.sh")

    conn = connect(db_path)
    try:
        if args.command == "list":
            list_hosts(conn)
        elif args.command == "show":
            show_host(conn, args.host_id)
        elif args.command == "simulate":
            simulate(conn, args.host_id, args.requested, args.season_drop, args.holdback, args.fee)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
