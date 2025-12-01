# Application Blank Display Issue

LCMD MicroServer implements traffic forwarding by creating Tun virtual network devices on various running platforms. This network architecture design is sensitive to developers' local network configurations.

If your client can start normally but the application interface appears blank, it is recommended to check network configuration rules to ensure that the domain `*.heiyu.space` and `fc03:1136:3800::/40` are set to direct connection mode.
And IPv6 is not disabled by proxy software.

For solutions, please refer to [Network Mechanism and VPN](./network.md)

Note: Some tools have a special mode option. Please turn off the `supervisor` option, otherwise LCMD Cloud Drive's `Open Local Application` function will be affected.
