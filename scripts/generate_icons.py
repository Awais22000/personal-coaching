"""Generate simple local PWA icons. Requires Pillow; no remote image assets."""

from pathlib import Path
from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1] / "public"
SCALE = 4


def create_icon(size: int, filename: str) -> None:
    canvas_size = size * SCALE
    image = Image.new("RGBA", (canvas_size, canvas_size), "#0a1019")
    draw = ImageDraw.Draw(image)

    def box(coords: tuple[int, int, int, int]) -> tuple[int, int, int, int]:
        return tuple(round(value * canvas_size / 128) for value in coords)

    draw.rounded_rectangle(box((9, 9, 119, 119)), radius=round(18 * canvas_size / 128), fill="#142942", outline="#477eb7", width=round(3 * canvas_size / 128))
    points = [(21, 67), (45, 67), (57, 40), (72, 89), (83, 67), (107, 67)]
    draw.line([(round(x * canvas_size / 128), round(y * canvas_size / 128)) for x, y in points], fill="#89baff", width=round(8 * canvas_size / 128), joint="curve")
    radius = round(4 * canvas_size / 128)
    for x, y in (points[0], points[-1]):
        cx, cy = round(x * canvas_size / 128), round(y * canvas_size / 128)
        draw.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), fill="#89baff")
    image.resize((size, size), Image.Resampling.LANCZOS).convert("RGB").save(ROOT / filename)


if __name__ == "__main__":
    create_icon(192, "icon-192.png")
    create_icon(512, "icon-512.png")
    create_icon(180, "apple-touch-icon.png")
