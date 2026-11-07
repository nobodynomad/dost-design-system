from pathlib import Path
import re
import unittest


class StandaloneModelTest(unittest.TestCase):
    def test_shared_file_has_no_external_render_dependencies(self):
        root = Path(__file__).resolve().parents[1]
        page = (root / "dost-model-standalone.html").read_text(encoding="utf-8")
        source = (root / "dost-model.html").read_text(encoding="utf-8")
        images = re.findall(r'<img\b[^>]*\bsrc="([^"]+)"', page)
        self.assertEqual(len(images), source.count("<img "))
        self.assertTrue(all(src.startswith("data:image/") for src in images))
        self.assertNotRegex(page, r'<script\b[^>]*\bsrc=|<link\b[^>]*rel="stylesheet"')
        styles = "\n".join(re.findall(r"<style>(.*?)</style>", page, re.S))
        self.assertTrue(styles)
        for url in re.findall(r'url\(([^)]+)\)', styles):
            self.assertTrue(url.strip("'\"").startswith(("data:", "#")))
        ids = set(re.findall(r'\bid="([^"]+)"', page))
        for ref in re.findall(r'<use\b[^>]*href="([^"]+)"', page):
            self.assertTrue(ref.startswith("#") and ref[1:] in ids)
        self.assertIn('<form class="feedback__form" method="dialog">', page)
