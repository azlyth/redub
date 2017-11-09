# Redub

A program that allows for easily redubbing the audio in a video.

## Install

- Windows: [Redub Setup.exe](https://github.com/azlyth/redub/releases/download/v1.0.0/Redub%20Setup.exe)
- Mac: [Redub.dmg](https://github.com/azlyth/redub/releases/download/v1.0.0/Redub.dmg)
- Linux: [Redub.AppImage](https://github.com/azlyth/redub/releases/download/v1.0.0/Redub.AppImage)

## Usage

First, obtain the following:

- A microphone
- A video file (VP8, VP9, Theora, H.264, MPEG-4)
- The subtitles for that video (SRT)

Then open Redub and:

- Create a new project.
- Start re-dubbing the video, one subtitle at a time.
- Redub the parts that you want. Doesn't have to be the whole video.
- When ready, hit **Export** and the program will create a new video with your recordings replacing the original audio.

Note that the new video will start from your first recording and end at your last.

## Develop

- Install [Node.js](https://nodejs.org/en/) and [Yarn](https://yarnpkg.com/en/).
- Install app dependencies with `make dependencies`.
- Run `make develop` to build and start the app.
- Start developing. Your changes will automagically be pushed into the running app.

## Thanks

Many thanks to [chentsulin](https://github.com/chentsulin) for [electron-react-boilerplate](https://github.com/chentsulin/electron-react-boilerplate).
It lets you get right to the fun part of app building.
