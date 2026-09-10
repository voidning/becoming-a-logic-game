#!/usr/bin/env python3
"""Serve a packaged prototype locally, with no third-party dependencies."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import webbrowser


def main():
    parser = argparse.ArgumentParser(description='启动 H5 试玩')
    parser.add_argument('--directory', default='site', help='包内的静态网页目录')
    parser.add_argument('--port', type=int, default=0, help='默认由系统选择空闲端口')
    parser.add_argument('--level', type=int, default=1, choices=range(1, 4))
    parser.add_argument('--open', action='store_true', dest='open_browser')
    args = parser.parse_args()
    package = Path(__file__).resolve().parent.parent
    directory = (package / args.directory).resolve()
    try:
        directory.relative_to(package)
    except ValueError:
        parser.error('--directory 必须指向归档包内的目录')
    if not (directory / 'index.html').is_file():
        parser.error('选定目录中找不到 index.html')
    handler = partial(SimpleHTTPRequestHandler, directory=str(directory))
    server = ThreadingHTTPServer(('127.0.0.1', args.port), handler)
    url = f'http://127.0.0.1:{server.server_address[1]}/?level={args.level}'
    print('试玩地址：' + url, flush=True)
    print('保持此窗口运行；按 Ctrl+C 停止。', flush=True)
    if args.open_browser:
        try:
            webbrowser.open(url)
        except Exception:
            print('请手动在浏览器中打开上面的地址。', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == '__main__':
    main()

