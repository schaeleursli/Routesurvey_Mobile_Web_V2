# Deploy Commands

## StartUp Service

```Bash
sudo apt-get install ghostscript  # Ubuntu/Debian
sudo npm install -g pm2
pm2 start index.js --name masl_template_api --node-args="--max-old-space-size=4096"
pm2 save
pm2 startup

sudo a2enmod headers
sudo a2enmod ssl
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod proxy_balancer
sudo a2enmod lbmethod_byrequests  # (Optional, for load balancing)

$ sudo sysctl -w net.ipv6.conf.all.disable_ipv6=1
$ sudo sysctl -w net.ipv6.conf.default.disable_ipv6=1
$ sudo sysctl -w net.ipv6.conf.lo.disable_ipv6=1

############ CERTIFICATE (If not set-up) ################
sudo apt update && sudo apt install certbot python3-certbot-apache -y  # Debian/Ubuntu
sudo yum install certbot python3-certbot-apache -y                    # CentOS/RHEL

sudo certbot certonly --manual --preferred-challenges=dns -d route-survey.survys.com -d *.route-survey.survys.com

sudo crontab -e

0 3 * * * /usr/bin/certbot renew --quiet