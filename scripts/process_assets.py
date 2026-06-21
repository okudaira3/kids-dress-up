from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = ROOT / "assets" / "source"
CARDS_DIR = ROOT / "public" / "assets" / "cards"
PREVIEW_DIR = ROOT / "public" / "assets" / "preview"
DEBUG_DIR = ROOT / "public" / "assets" / "debug"

CARD_WIDTH = 512
PREVIEW_SIZE = (600, 800)
WHITE_THRESHOLD = 245


@dataclass(frozen=True)
class AssetConfig:
    source_name: str
    outputs: dict[str, tuple[float, float, float, float]]


ASSETS: tuple[AssetConfig, ...] = (
    AssetConfig(
        "characters.png",
        {
            "person-girl.png": (0.03, 0.03, 0.49, 0.97),
            "person-boy.png": (0.51, 0.03, 0.97, 0.97),
        },
    ),
    AssetConfig(
        "tops.png",
        {
            "top-tshirt.png": (0.03, 0.03, 0.49, 0.49),
            "top-shirt.png": (0.51, 0.03, 0.97, 0.49),
            "top-blouse.png": (0.03, 0.51, 0.49, 0.97),
            "top-trainer.png": (0.51, 0.51, 0.97, 0.97),
        },
    ),
    AssetConfig(
        "bottoms.png",
        {
            "bottom-pants.png": (0.03, 0.03, 0.49, 0.49),
            "bottom-jeans.png": (0.51, 0.03, 0.97, 0.49),
            "bottom-shorts.png": (0.03, 0.51, 0.49, 0.97),
            "bottom-skirt.png": (0.51, 0.51, 0.97, 0.97),
        },
    ),
    AssetConfig(
        "accessories.png",
        {
            "accessory-backpack.png": (0.03, 0.10, 0.33, 0.92),
            "accessory-glasses.png": (0.35, 0.10, 0.65, 0.92),
            "accessory-hat.png": (0.67, 0.10, 0.97, 0.92),
        },
    ),
)


def ensure_directories() -> None:
    for directory in (CARDS_DIR, PREVIEW_DIR, DEBUG_DIR):
        directory.mkdir(parents=True, exist_ok=True)


def validate_sources() -> list[Path]:
    missing = [SOURCE_DIR / asset.source_name for asset in ASSETS if not (SOURCE_DIR / asset.source_name).exists()]
    if missing:
        missing_list = "\n".join(f"- {path}" for path in missing)
        raise FileNotFoundError(f"Missing source images:\n{missing_list}")
    return [SOURCE_DIR / asset.source_name for asset in ASSETS]


def ratio_to_box(size: tuple[int, int], ratio: tuple[float, float, float, float]) -> tuple[int, int, int, int]:
    width, height = size
    left = max(0, int(round(width * ratio[0])))
    top = max(0, int(round(height * ratio[1])))
    right = min(width, int(round(width * ratio[2])))
    bottom = min(height, int(round(height * ratio[3])))
    if left >= right or top >= bottom:
        raise ValueError(f"Invalid crop box from ratio: {ratio}")
    return left, top, right, bottom


def resize_to_width(image: Image.Image, width: int) -> Image.Image:
    scale = width / image.width
    height = int(round(image.height * scale))
    return image.resize((width, height), Image.Resampling.LANCZOS)


def whiten_to_alpha(image: Image.Image, threshold: int = WHITE_THRESHOLD) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            red, green, blue, alpha = pixels[x, y]
            if red >= threshold and green >= threshold and blue >= threshold:
                pixels[x, y] = (red, green, blue, 0)
    return rgba


def build_preview(card_image: Image.Image) -> Image.Image | None:
    working = card_image.convert("RGBA")
    left = int(working.width * 0.12)
    top = int(working.height * 0.12)
    right = int(working.width * 0.88)
    bottom = int(working.height * 0.75)
    candidate = working.crop((left, top, right, bottom))
    transparent = whiten_to_alpha(candidate)
    edge_clear = 20
    pixels = transparent.load()
    for y in range(transparent.height):
        for x in range(transparent.width):
            if x < edge_clear or y < edge_clear or x >= transparent.width - edge_clear or y >= transparent.height - edge_clear:
                red, green, blue, _ = pixels[x, y]
                pixels[x, y] = (red, green, blue, 0)
    bbox = transparent.getbbox()
    if not bbox:
        return None

    item = transparent.crop(bbox)
    scale = min(PREVIEW_SIZE[0] / item.width, PREVIEW_SIZE[1] / item.height)
    resized = item.resize(
        (max(1, int(round(item.width * scale))), max(1, int(round(item.height * scale)))),
        Image.Resampling.LANCZOS,
    )

    canvas = Image.new("RGBA", PREVIEW_SIZE, (255, 255, 255, 0))
    offset_x = (PREVIEW_SIZE[0] - resized.width) // 2
    offset_y = max(24, int(PREVIEW_SIZE[1] * 0.12) - resized.height // 8)
    offset_y = min(offset_y, PREVIEW_SIZE[1] - resized.height)
    canvas.alpha_composite(resized, (offset_x, offset_y))
    return canvas


def create_contact_sheet(card_paths: Iterable[Path]) -> Path:
    paths = list(sorted(card_paths))
    thumb_width = 220
    label_height = 24
    padding = 20
    columns = 3
    rows = (len(paths) + columns - 1) // columns
    sheet_width = padding + columns * (thumb_width + padding)
    sheet_height = padding + rows * (thumb_width + label_height + padding)

    sheet = Image.new("RGB", (sheet_width, sheet_height), "white")
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()

    for index, path in enumerate(paths):
        row = index // columns
        column = index % columns
        x = padding + column * (thumb_width + padding)
        y = padding + row * (thumb_width + label_height + padding)

        with Image.open(path) as image:
            thumb = image.convert("RGB")
            thumb.thumbnail((thumb_width, thumb_width), Image.Resampling.LANCZOS)
            thumb_x = x + (thumb_width - thumb.width) // 2
            thumb_y = y + (thumb_width - thumb.height) // 2
            sheet.paste(thumb, (thumb_x, thumb_y))

        label = path.name
        bbox = draw.textbbox((0, 0), label, font=font)
        text_width = bbox[2] - bbox[0]
        draw.text((x + (thumb_width - text_width) // 2, y + thumb_width + 4), label, fill="black", font=font)

    output_path = DEBUG_DIR / "contact-sheet.png"
    sheet.save(output_path)
    return output_path


def main() -> None:
    ensure_directories()
    validate_sources()

    generated_cards: list[Path] = []
    generated_previews: list[Path] = []

    for asset in ASSETS:
        source_path = SOURCE_DIR / asset.source_name
        with Image.open(source_path) as image:
            print(f"Processing {asset.source_name}: {image.width}x{image.height}")
            for output_name, ratio in asset.outputs.items():
                crop_box = ratio_to_box(image.size, ratio)
                card = image.crop(crop_box)
                card_resized = resize_to_width(card, CARD_WIDTH)
                card_path = CARDS_DIR / output_name
                card_resized.save(card_path, format="PNG")
                generated_cards.append(card_path)
                print(f"  card    {output_name:<24} {crop_box} -> {card_resized.width}x{card_resized.height}")

                if output_name.startswith("person-"):
                    continue

                preview = build_preview(card_resized)
                if preview is None:
                    print(f"  preview skipped for {output_name}")
                    continue

                preview_path = PREVIEW_DIR / output_name
                preview.save(preview_path, format="PNG")
                generated_previews.append(preview_path)
                print(f"  preview {output_name:<24} -> {PREVIEW_SIZE[0]}x{PREVIEW_SIZE[1]}")

    contact_sheet_path = create_contact_sheet(generated_cards)
    print(f"Created {len(generated_cards)} card images in {CARDS_DIR}")
    print(f"Created {len(generated_previews)} preview images in {PREVIEW_DIR}")
    print(f"Created contact sheet: {contact_sheet_path}")


if __name__ == "__main__":
    main()
