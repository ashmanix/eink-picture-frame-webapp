## E-Ink Picture Frame Web App

<p align="center">
<image height="400px" src="./setup_files/app-screenshot.png">
</p>

## Introduction

This is a simple app designed to be used with a Raspberry Pi or Raspberry Pi Zero connected to a Pimoroni Inky Impression 7.3" screen (2025 edition [details here](https://learn.pimoroni.com/article/getting-started-with-inky-impression)). The app allows you to upload images to the Pi as well as view all images already loaded on it. You can then select an image to display on the E-Ink screen.

The app uses The [FastAPI Python framework](https://fastapi.tiangolo.com/) for the backend API along with the [Jinja2](https://jinja.palletsprojects.com/en/stable/) templating framework to create server side page rendering. Styling is handled using the [Bulma CSS framework](https://bulma.io/).

## Installation

### Step 1

To run this app clone the repo to your Raspberry Pi and then install the [uv](https://docs.astral.sh/uv/) Python library using the following command:

```shell
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Step 2

Clone the repo to a location on your Raspberry Pi:

```shell
git clone https://github.com/ashmanix/eink-picture-frame-webapp.git
```

### Step 3

Once complete you will need to create a `.env` file inside the root folder of the project

```shell
touch .env
```

You can look at the `.env.example` file in the repo to see what environment variables are required.

### Step 4

To run the app you now just need to run one of the following commands:
For a dev environment:

```shell
uv run dev
```

For a more production style environment:

```shell
uv run serve
```

The app should then be accessible from `localhost:8000` or `{pi-ip-address}:8000`

## Usage

The UI should hopefully be self explanatory.

### Upload Files

To upload files you click the upload button to show a popup giving you the option to select files. Once selected clicking on the popup upload button will load them onto the raspberry pi.

### View Files

A list is shown on the main page listing existing images stored on the device. You can also filter these using the search box.

### Delete Files

You can delete files one of two ways:

- Individually by clicking the delete button on an image row in the table.
- In groups by clicking on images in the table and then selecting the delete all button at the top of the table.

### Set Image File

You can set the image file to be displayed by clicking on the set image button on a row in the table. This takes a while to process so expect to wait up to a minute before a success message is returned from the API.

## Configure To Run On Boot

If you look at the `setup_files/pictureframe.service` file you have a template you can use to set the app as a service that will automatically run on boot. Make sure to replace any mentions of `pi` in the file with what user name you have set on the device otherwise it wont work.

To set the service do the following:

### Step 1

Copy the `pictureframe.service` file into following folder location:

```
/etc/systemd/system/pictureframe.service
```

### Step 2

Run the following commands to restart all system services, enable the new picture frame service and then start it:

```shell
sudo systemctl daemon-reload
sudo systemctl enable pictureframe.service
sudo systemctl start pictureframe.service
sudo systemctl status pictureframe.service
```

The last command will show you the status of the new service. If it's showing an error you can debug by looking at the logs for the service by using the following command:

```shell
journalctl -u eink-picture-frame.service -e -f
```

If you have issues and need to modify the service file run the 4 commands again, in order and then check the status again.
