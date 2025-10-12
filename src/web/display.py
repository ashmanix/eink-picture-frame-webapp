import sys
import pathlib
import argparse
from PIL import Image
from .logger import logger


def get_display():
    if sys.platform.startswith("linux"):

        from inky.auto import auto

        return auto()
    return None


def display_image(display: any, file_location: str):
    if sys.platform.startswith("linux"):
        parser = argparse.ArgumentParser()

        parser.add_argument(
            "--saturation",
            "-s",
            type=float,
            default=0.5,
            help="Colour palette saturation",
        )
        parser.add_argument("--file", "-f", type=pathlib.Path, help="Image file")

        args, _ = parser.parse_known_args()

        saturation = args.saturation

        # if not args.file:
        #     print(
        #         f"""Usage:
        #         {sys.argv[0]} --file image.png (--saturation 0.5)"""
        #     )
        #     sys.exit(1)
        image = Image.open(file_location)
        resized_image = image.resize(display.resolution)
        try:
            display.set_image(resized_image, saturation=saturation)
        except TypeError:
            display.set_image(resized_image)
        display.show()
    else:
        logger.warning(
            "No display found, check to see if this running on a RaspberryPi!"
        )
