#!/bin/sh

wget https://www.unrealircd.org/downloads/Unreal3.2.10.4.tar.gz
tar -zxvf Unreal3.2.10.4.tar.gz

cp magic.exp Unreal3.2.10.4/magic.exp
cd Unreal3.2.10.4/
./magic.exp
make
