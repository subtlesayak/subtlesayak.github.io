"""Prepare portfolio images for the web. Run with Python and Pillow installed."""
from hashlib import sha256
from io import BytesIO
from json import dumps
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
HOST = 'https://subtlesayak.github.io'
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.avif'}
OUTPUT = ROOT / 'Resources' / 'web-images'


def lines(path):
    return [line.strip() for line in path.read_text().splitlines()
            if line.strip() and not line.lstrip().startswith('#')]


def asset(ref, base='/'):
    url = urlsplit(urljoin(HOST + base, ref.strip().removesuffix('*')))
    if url.netloc != urlsplit(HOST).netloc:
        return None
    key = unquote(url.path)
    file = (ROOT / key.lstrip('/')).resolve()
    if not file.is_relative_to(ROOT) or not file.is_file() or file.suffix.lower() not in IMAGE_EXTENSIONS:
        return None
    return key, file


def open_image(file):
    with Image.open(file) as original:
        return ImageOps.exif_transpose(original)


def web_copy(file, image, width, group, max_bytes):
    directory = OUTPUT / group
    directory.mkdir(parents=True, exist_ok=True)
    digest = sha256(file.read_bytes()).hexdigest()[:12]
    target = directory / f'{digest}-{width}.webp'
    copy = image.copy()
    copy.thumbnail((width, round(image.height * min(1, width / image.width))), Image.Resampling.LANCZOS)
    if target.exists():
        if target.stat().st_size >= max_bytes:
            return None
    else:
        encoded = BytesIO()
        copy.save(encoded, 'WEBP', quality=84, method=6,
                  icc_profile=image.info.get('icc_profile', b''))
        if encoded.tell() >= max_bytes:
            return None
        target.write_bytes(encoded.getvalue())
    return {'url': '/' + target.relative_to(ROOT).as_posix(),
            'width': copy.width, 'height': copy.height}


def main():
    portfolio_paths = lines(ROOT / 'Config' / 'projects.txt')
    site = (ROOT / 'Config' / 'client-websites.txt').read_text().split('---')
    card_refs = [site[i].strip() for i in range(4, len(site), 6)]
    media = {}
    for project in portfolio_paths:
        folder = ROOT / 'Projects' / project
        card_refs.append((folder / 'description.txt').read_text().split('---')[3].strip())
        for line in lines(folder / 'media.txt'):
            for ref in line.split(' // '):
                local = asset(ref, f'/Projects/{project}/')
                if local and local[0] not in media:
                    key, file = local
                    image = open_image(file)
                    info = {'width': image.width, 'height': image.height}
                    if image.width >= 1200:
                        small = web_copy(file, image, 800, 'media', file.stat().st_size * 0.9)
                        if small:
                            info['small'] = small
                    media[key] = info

    cards = {}
    for ref in card_refs:
        local = asset(ref)
        if local:
            key, file = local
            image = open_image(file)
            if image.width > 800 or file.stat().st_size > 100_000:
                card = web_copy(file, image, 800, 'cards', file.stat().st_size)
                if card:
                    cards[key] = card['url']

    photos = {}
    for name in lines(ROOT / 'Projects' / 'Photography' / 'media.txt'):
        local = asset(name, '/Projects/Photography/')
        if local:
            _, file = local
            photo = web_copy(file, open_image(file), 1600, 'photos', file.stat().st_size)
            if photo:
                photos[name] = photo

    profile = ROOT / 'Resources' / 'profile' / 'sayak-profile.jpg'
    image = open_image(profile)
    image.thumbnail((384, 384), Image.Resampling.LANCZOS)
    image.save(profile.with_suffix('.webp'), 'WEBP', quality=84, method=6,
               icc_profile=image.info.get('icc_profile', b''))
    (ROOT / 'Config' / 'project-image-layouts.json').write_text(
        dumps({'cards': cards, 'media': media}, separators=(',', ':')) + '\n')
    (ROOT / 'Config' / 'photo-display.json').write_text(dumps(photos, separators=(',', ':')) + '\n')
    print(f'{len(cards)} card images, {len(media)} image layouts and {len(photos)} photo display copies.')


if __name__ == '__main__':
    main()
