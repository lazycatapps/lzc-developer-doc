# KVM Mode

## Advantages of KVM Virtual Machines
The previous chapters discussed application development details and techniques based on lzcapp mode.

Actually, in daily learning and research, most of our time is not spent developing applications, but doing technical experiments.

At this time, KVM mode is more flexible and convenient than lzcapp mode:
1. Easy to tinker: KVM doesn't have as many restrictions as lzcapp, and tinkering feels more like public cloud servers
2. Network penetration: KVM can directly utilize LCMD MicroServer's network penetration capabilities. When you start some experimental services in KVM, the external network can immediately access them
3. Cloud virtualization: You can virtualize different systems like ArchLinux, Windows, etc. You can run Windows software like Thunder and QQ in the cloud. Whether for cloud computer office work or environment testing, it's very convenient

From a usage experience perspective, KVM mode feels more like operating public cloud servers. The only difference is that LCMD MicroServer's hardware computing resources and network resources are exclusive, not subject to public cloud peak period resource limitations.

## Virtual Machine and Development Library Installation
Usage method example, let's take ArchLinux as an example:
1. First, install the ArchLinux virtual machine, please refer to the [guide](https://lazycat.cloud/playground/guideline/423)
2. Install corresponding development libraries in the virtual machine using package managers, you can use pacman or aur
3. Write and start background service scripts. Background services can rely on LCMD's network penetration to provide services to the external network

## External Access Ports
Currently, virtual machines support dynamic port forwarding. Except for some ports used for `vnc` and other services, other ports are normally open. If you find that some ports cannot be accessed, please check the firewall settings inside the virtual machine. If the port is not blocked, it may be that the port is already occupied or temporarily doesn't support forwarding. You can refer to the [Using `SSH` to forward ports inside virtual machines](#使用ssh转发虚拟机内端口) chapter and use SSH for forwarding.

### Ports Not Currently Supported
| Protocol |       |       |       |       |       |
| :---:    | :---: | :---: | :---: | :---: | :---: |
|   TCP    | 49199 | 49200 |  445  | 8006  | 5700  |
|   UDP    | 49199 |   -   |   -   |   -   |   -   |

### Using `SSH` to Forward Ports Inside Virtual Machines
If the required port is occupied or cannot be forwarded, you can also try using `SSH forward` in the virtual machine to forward the needed port to local, or forward local ports to the virtual machine.
Related tutorials can refer to [ArchWiki-OpenSSH](https://wiki.archlinux.org/title/OpenSSH#Forwarding_other_ports). Windows users can also use GUI tools like [Putty](https://apps.microsoft.com/detail/xpfnzksklbp7rj?hl=en-US&gl=US) for SSH forwarding.

Example (Enable SSH forwarding in Ubuntu virtual machine):
 - If `openssh-server` is not installed, you can use `apt install openssh-server` to install the `OpenSSH` service
 - Use the command ```sudo useradd -M -U -s /bin/false forward``` to create a user for forwarding
 - Use the command ```sudo passwd forward``` to set the password for this user
 - Create file `30-forward.conf` in `/etc/ssh/sshd_config.d/` and fill in the following configuration:
 ```bash
 Match User forward
    AllowTcpForwarding yes # Enable TCP forwarding
    PermitTTY no # Disable ptty
    X11Forwarding no # Disable X11 forwarding
    ForceCommand echo 'This account is restricted to port forwarding only.' # Prompt
    PasswordAuthentication yes # Allow password login
 ```
 - Use `sudo systemctl restart sshd` to restart the `sshd` service
 - Execute `ssh -N -L <port>:localhost:<port> forward@ubuntu.<box_name>.heiyu.space` on the local computer to forward ports from the virtual machine to the local computer.

## External Network Service Connection Method
The subdomain for ArchLinux applications is archlinux. Assuming your device name is devicename and the external TCP port is 10086, you can access the externally provided TCP service by accessing archlinux.devicename.heiyu.space:10086.