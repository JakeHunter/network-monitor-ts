A simple app for monitoring devices on your local network.

I created this to monitor my nextcloud instance running on an old laptop.

npm install ping net-snmp express
npm install --save-dev @types/express
npm i --save-dev @types/ping

I save the IP I actually want to monitor in a .env file

todo: make server display SNMP info