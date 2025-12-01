# Self-Hosted Network Penetration

LCMD MicroServer was designed from the beginning for `decentralization`. We hope users can freely build their own cloud services and access their data for free. We even hope that one day users won't need to rely on official infrastructure for network penetration.

The current design of LCMD MicroServer is that when terminals like phones and computers connect to LCMD, it provides fast DNS query services. When users' networks have public IPs or good NAT environments, our design ensures that users' terminals directly connect to their home LCMD for data transmission. The benefits of this are:
1. Users' private data is absolutely protected
2. Users can fully utilize their home bandwidth to provide high-speed external internet services
3. Decentralized network transmission is more stable

For some extreme situations where network penetration cannot be performed, our servers also provide free network relay services. These relay services in extreme situations are end-to-end encrypted throughout, and no one (including us) can know users' data.

Of course, for some advanced users, if they can build their own network penetration services, they will feel more reassured. We considered the needs of advanced users from the beginning of our design. We will provide a "Network Penetration Service Setup Guide" within the next year to help advanced users build their own network penetration services.

::: tip Self-Built Relay Server
If you have a public cloud server with large bandwidth, but LCMD or client is in a special network environment, you can build your own relay server to get a better network experience.

Currently, the specific deployment method needs to be consulted with the VIP group. After subsequent improvements, a self-service setup method will be launched that doesn't require official scheduling adjustments.
:::
