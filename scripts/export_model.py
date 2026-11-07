"""Build one HTML file that can be opened without a server or network."""

import base64
import mimetypes
from pathlib import Path
import re
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parents[1]
THEME = ROOT / "www/themes/morph"
SPRITE = THEME / "assets/images/sprite.svg"
OUTPUT = ROOT / "dost-model-standalone.html"


def local_file(url, folder=ROOT):
    parts = urlsplit(url)
    path = (folder / parts.path).resolve()
    if parts.scheme or parts.netloc or ROOT not in path.parents or not path.is_file():
        raise ValueError(f"Expected a local project asset: {url}")
    return path


def data_uri(path):
    mime = mimetypes.guess_type(path.name)[0]
    if not mime:
        raise ValueError(f"Unknown media type: {path.name}")
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode("ascii")


def stylesheet(match):
    path = local_file(match[1])
    css = re.sub(r"""url\(["']?([^)"']+)["']?\)""",
                 lambda m: "url(" + data_uri(local_file(m[1], path.parent)) + ")",
                 path.read_text(encoding="utf-8"))
    return "<style>\n" + css + "\n</style>"


def sprite_link(match):
    url = match[2]
    fragment = urlsplit(url).fragment
    if not fragment or local_file(url) != SPRITE:
        raise ValueError(f"Unknown sprite reference: {url}")
    return match[1] + "#" + fragment + '"'


def export():
    html = (ROOT / "dost-model.html").read_text(encoding="utf-8")
    html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', stylesheet, html)
    script_tag = re.compile(r'^[ \t]*<script src="([^"]+)" defer></script>\r?\n?', re.MULTILINE)
    scripts = [local_file(url).read_text(encoding="utf-8") for url in script_tag.findall(html)]
    html = script_tag.sub("", html)
    html = re.sub(r'(<img\b[^>]*?\bsrc=")([^"]+)"',
                  lambda m: m[1] + data_uri(local_file(m[2])) + '"', html)
    html = re.sub(r'(<use\b[^>]*?\bhref=")([^"#]+#[^"]+)"', sprite_link, html)

    sprite = SPRITE.read_text(encoding="utf-8").split(">", 1)[1]
    sprite = '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">' + sprite
    html = html.replace('<body id="top">', '<body id="top">\n' + sprite, 1)
    form = '<form class="feedback__form" action="/api/callback" method="post">'
    if html.count(form) != 1:
        raise ValueError("Callback form markup changed; check the offline submission behavior")
    html = html.replace(form, '<form class="feedback__form" method="dialog">')

    notices = [p.read_text(encoding="utf-8") for p in
               (THEME / "src/fonts/OFL.txt", THEME / "src/images/icons/LICENSE")]
    end = '<script type="text/plain" id="asset-licenses">\n' + "\n\n".join(notices) + "\n</script>"
    for source in scripts:
        safe = re.sub(r"</script", lambda _: r"<\/script", source, flags=re.I)
        end += "\n<script>\n" + safe + "\n</script>"
    OUTPUT.write_text(html.replace("</body>", end + "\n</body>", 1), encoding="utf-8")
    print(f"{OUTPUT.name}: {OUTPUT.stat().st_size:,} bytes")


if __name__ == "__main__":
    export()
