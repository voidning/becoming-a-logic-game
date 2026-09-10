#!/usr/bin/env python3
"""Check the frozen package's SHA256SUMS without altering its files."""
from hashlib import sha256
from pathlib import Path
import sys

package = Path(__file__).resolve().parent.parent
manifest = package / 'SHA256SUMS'
errors = []
count = 0
for line in manifest.read_text(encoding='utf-8').splitlines():
    digest, relative = line.split('  ', 1)
    target = (package / relative).resolve()
    try:
        target.relative_to(package)
    except ValueError:
        errors.append('清单路径越界：' + relative)
        continue
    if not target.is_file():
        errors.append('文件缺失：' + relative)
    elif sha256(target.read_bytes()).hexdigest() != digest:
        errors.append('内容已改变：' + relative)
    count += 1
if errors:
    print('\n'.join(errors))
    sys.exit(1)
print(f'完整性通过：{count} 个文件均与归档校验值一致。')

