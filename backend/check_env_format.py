from pathlib import Path


def main() -> None:
    env_path = Path(".env")

    if not env_path.exists():
        print("No backend/.env file found.")
        return

    bad_lines: list[tuple[int, str]] = []

    for index, raw_line in enumerate(env_path.read_text().splitlines(), start=1):
        line = raw_line.strip()

        if not line or line.startswith("#"):
            continue

        if "=" not in line:
            bad_lines.append((index, "missing '='"))
            continue

        key, _value = line.split("=", 1)

        if not key.strip():
            bad_lines.append((index, "missing key"))
            continue

        if " " in key:
            bad_lines.append((index, "space in key"))

        quote_count = line.count('"') + line.count("'")
        if quote_count % 2 != 0:
            bad_lines.append((index, "unclosed quote"))

    if not bad_lines:
        print("backend/.env format looks valid.")
        return

    print("backend/.env has formatting issues:")
    for line_number, reason in bad_lines:
        print(f"Line {line_number}: {reason}")

    print("Open backend/.env and fix these lines. Do not paste secret values into chat.")
    raise SystemExit(1)


if __name__ == "__main__":
    main()
