import ipaddress
import socket
from typing import Optional, Tuple
from urllib.parse import urlparse


# Blocked private and internal IPv4 subnets
BLOCKED_IPV4_NETWORKS = [
    ipaddress.ip_network("0.0.0.0/8"),          # Current network (only valid as source)
    ipaddress.ip_network("10.0.0.0/8"),         # Private-Use (RFC 1918)
    ipaddress.ip_network("100.64.0.0/10"),      # Shared Address Space (RFC 6598)
    ipaddress.ip_network("127.0.0.0/8"),        # Loopback
    ipaddress.ip_network("169.254.0.0/16"),     # Link-Local (including 169.254.169.254 cloud metadata)
    ipaddress.ip_network("172.16.0.0/12"),      # Private-Use (RFC 1918)
    ipaddress.ip_network("192.0.0.0/24"),       # IETF Protocol Assignments
    ipaddress.ip_network("192.0.2.0/24"),       # TEST-NET-1 (RFC 5737)
    ipaddress.ip_network("192.168.0.0/16"),     # Private-Use (RFC 1918)
    ipaddress.ip_network("198.18.0.0/15"),      # Benchmarking (RFC 2544)
    ipaddress.ip_network("198.51.100.0/24"),    # TEST-NET-2 (RFC 5737)
    ipaddress.ip_network("203.0.113.0/24"),     # TEST-NET-3 (RFC 5737)
    ipaddress.ip_network("224.0.0.0/4"),        # Multicast (RFC 1112)
    ipaddress.ip_network("240.0.0.0/4"),        # Reserved for Future Use
    ipaddress.ip_network("255.255.255.255/32"), # Limited Broadcast
]

# Blocked IPv6 subnets
BLOCKED_IPV6_NETWORKS = [
    ipaddress.ip_network("::1/128"),            # Loopback
    ipaddress.ip_network("::/128"),             # Unspecified
    ipaddress.ip_network("fc00::/7"),           # Unique Local Address (RFC 4193)
    ipaddress.ip_network("fe80::/10"),          # Link-Local Unicast
    ipaddress.ip_network("ff00::/8"),           # Multicast
    ipaddress.ip_network("2001:db8::/32"),      # Documentation
]

# Blocked hostnames associated with internal cloud metadata services
BLOCKED_METADATA_HOSTNAMES = {
    "metadata.google.internal",
    "instance-data",
    "169.254.169.254",
    "100.100.100.200",
}

# Permitted outbound HTTP/HTTPS ports for media
ALLOWED_PORTS = {80, 443, 8080, 8443}


def is_ip_blocked(ip: ipaddress.IPv4Address | ipaddress.IPv6Address) -> bool:
    """Check if an IP address belongs to any blocked / private / metadata network."""
    if isinstance(ip, ipaddress.IPv4Address):
        for net in BLOCKED_IPV4_NETWORKS:
            if ip in net:
                return True
    elif isinstance(ip, ipaddress.IPv6Address):
        for net in BLOCKED_IPV6_NETWORKS:
            if ip in net:
                return True
    return False


def validate_url_security(
    url: str,
    allow_private_networks: bool = False,
) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    Validate a URL to protect against SSRF, DNS rebinding, and unauthorized schemes.

    Returns:
        (is_safe: bool, error_reason: Optional[str], resolved_ip: Optional[str])
    """
    if not url or not isinstance(url, str):
        return False, "URL cannot be empty.", None

    url_clean = url.strip()
    try:
        parsed = urlparse(url_clean)
    except Exception as exc:
        return False, f"Failed to parse URL: {exc}", None

    # Scheme verification (strictly http or https only)
    if parsed.scheme.lower() not in ("http", "https"):
        return False, f"Unsupported URL scheme '{parsed.scheme}'. Only HTTP and HTTPS are permitted.", None

    hostname = parsed.hostname
    if not hostname:
        return False, "Missing hostname in URL.", None

    hostname_lower = hostname.lower().strip("[]")

    # Cloud metadata hostnames
    if hostname_lower in BLOCKED_METADATA_HOSTNAMES:
        return False, "Access to cloud metadata endpoints is prohibited.", None

    # Internal TLDs
    if (
        hostname_lower.endswith(".localhost")
        or hostname_lower.endswith(".local")
        or hostname_lower.endswith(".internal")
        or hostname_lower.endswith(".lan")
        or hostname_lower == "localhost"
    ):
        if not allow_private_networks:
            return False, f"Access to local or internal domain '{hostname_lower}' is blocked.", None

    # Port validation
    port = parsed.port or (443 if parsed.scheme.lower() == "https" else 80)
    if port not in ALLOWED_PORTS and not allow_private_networks:
        return False, f"Port {port} is not in the allowed outbound media ports list.", None

    # Direct IP parsing or DNS resolution
    try:
        # Check if hostname is directly an IP address
        direct_ip = ipaddress.ip_address(hostname_lower)
        if not allow_private_networks and is_ip_blocked(direct_ip):
            return False, f"IP address {direct_ip} is in a private, loopback, or reserved range.", str(direct_ip)
        return True, None, str(direct_ip)
    except ValueError:
        # Not a raw IP literal; proceed to DNS resolution
        pass

    try:
        addr_info = socket.getaddrinfo(hostname_lower, port, proto=socket.IPPROTO_TCP)
    except socket.gaierror as exc:
        return False, f"DNS resolution failed for host '{hostname}': {exc}", None
    except Exception as exc:
        return False, f"Network resolution error for host '{hostname}': {exc}", None

    if not addr_info:
        return False, f"No IP address found for host '{hostname}'.", None

    resolved_ip_str: Optional[str] = None
    for item in addr_info:
        sockaddr = item[4]
        ip_str = sockaddr[0]
        resolved_ip_str = ip_str
        try:
            ip_obj = ipaddress.ip_address(ip_str)
            if not allow_private_networks and is_ip_blocked(ip_obj):
                return (
                    False,
                    f"Resolved host '{hostname}' maps to blocked IP {ip_str} in private or restricted subnet.",
                    ip_str,
                )
        except ValueError:
            return False, f"Invalid resolved IP '{ip_str}'.", None

    return True, None, resolved_ip_str
