# rvlvvr-server

Broker server for messages from [rvlvvr-client](https://github.com/rvlvvr/rvlvvr-client)

## setup

    npm install
    cp local.json-dist local.json

If need be, change your `port` in local.json. Also change the `url` to whatever your domain is.

    npm start

## Known broker servers for RVLVVR

This is a list of known brokers that are participating in RVLVVR. You can change `outgoingServers` in your local.json file to broadcast to one or more of the servers listed below:

* [http://rvlvvr.net:80](http://rvlvvr.net:80)
* [http://meta.rtorr.com:80](http://meta.rtorr.com:80)
