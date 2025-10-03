npm run build
npx electron-builder --linux deb --armv7l

scp dist/root_3.1.0_armv7l.deb <user>>@<IP_RASPBERRY>:/home/pi/
