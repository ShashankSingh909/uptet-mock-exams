from __future__ import annotations

import argparse
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PDFTOPPM = (
    Path.home()
    / ".cache"
    / "codex-runtimes"
    / "codex-primary-runtime"
    / "dependencies"
    / "native"
    / "poppler"
    / "Library"
    / "bin"
    / "pdftoppm.exe"
)


def render(pdf: Path, output_dir: Path, dpi: int) -> None:
    if not PDFTOPPM.exists():
        raise SystemExit(f"pdftoppm not found: {PDFTOPPM}")
    if not pdf.exists():
        raise SystemExit(f"PDF not found: {pdf}")

    output_dir.mkdir(parents=True, exist_ok=True)
    prefix = output_dir / "page"
    subprocess.run(
        [
            str(PDFTOPPM),
            "-png",
            "-r",
            str(dpi),
            str(pdf),
            str(prefix),
        ],
        check=True,
    )

    pages = sorted(output_dir.glob("page-*.png"))
    if len(pages) != 25:
        raise SystemExit(f"Expected 25 rendered pages, found {len(pages)}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--paper", choices=("paper1", "paper2"), required=True)
    parser.add_argument("--dpi", type=int, default=240)
    args = parser.parse_args()

    render(
        ROOT / "source" / f"{args.paper}.pdf",
        ROOT / "tmp" / "rendered" / args.paper,
        args.dpi,
    )


if __name__ == "__main__":
    main()
