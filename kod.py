#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import re
import sys
import argparse
from pathlib import Path

def create_project_files(input_filename="kod.txt"):
    print(f"'{input_filename}' dosyasından proje yapısı okunuyor...")

    try:
        with open(input_filename, 'r', encoding='utf-8') as f:
            project_content = f.read()
        print(f"'{input_filename}' başarıyla okundu.")
    except FileNotFoundError:
        print(f"HATA: '{input_filename}' dosyası bulunamadı!", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"HATA: Dosya okunurken hata: {e}", file=sys.stderr)
        sys.exit(1)

    # Updated regex pattern to better handle file sections and end marker
    pattern = re.compile(
        r"########## FILE: (.*?) ##########\n(.*?)(?=(########## FILE: |################################################## DOSYA SONU|$))",
        re.DOTALL
    )

    matches = pattern.finditer(project_content)
    created_files_count = 0
    errors = []
    base_dir = Path.cwd()

    print("\nDosyalar oluşturuluyor...")
    for match in matches:
        file_path_str = match.group(1).strip()
        file_content = match.group(2).strip()
        file_path = base_dir / Path(file_path_str.replace('/', os.path.sep))

        print(f"-> İşleniyor: {file_path_str}")
        try:
            dir_path = file_path.parent
            if not dir_path.exists():
                print(f"   Klasör oluşturuluyor: {dir_path}")
                os.makedirs(dir_path, exist_ok=True)

            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(file_content)
            created_files_count += 1
            print(f"   + Dosya oluşturuldu: {file_path_str}")
        except OSError as e:
            error_message = f"   ! HATA: {file_path_str} oluşturulurken: {e}"
            print(error_message, file=sys.stderr)
            errors.append(error_message)
        except Exception as e:
            error_message = f"   ! Beklenmedik HATA ({file_path_str}): {e}"
            print(error_message, file=sys.stderr)
            errors.append(error_message)

    print("\n-----------------------------------------")
    if not errors:
        print(f"İşlem tamamlandı! {created_files_count} dosya oluşturuldu.")
    else:
        print(f"İşlem hatalarla tamamlandı. {created_files_count} dosya oluşturuldu, {len(errors)} hata.")
        print("\nHatalar:")
        for err in errors:
            print(err, file=sys.stderr)
    print("-----------------------------------------")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Metin dosyasından proje yapısını oluşturur.")
    parser.add_argument('-f', '--file', default='kod.txt', help="Okunacak dosya adı (varsayılan: kod.txt)")
    args = parser.parse_args()
    create_project_files(args.file)