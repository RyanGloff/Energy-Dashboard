### Create service file
Create a new file `/etc/systemd/system/energy-dashboard.service`
Example contents:
```
[Unit]
Description="Energy Dashboard"

[Service]
ExecStart=/home/ryan/.nvm/versions/node/v16.15.1/bin/node main.js
WorkingDirectory=/home/ryan/dev/Energy-Dashboard
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=EnergyDashboard

[Install]
WantedBy=multi-user.target
```

### Start as service
```
systemctl start energy-dashboard.service
```

### Start the service on computer startup
```
systemctl enable energy-dashboard.service
```