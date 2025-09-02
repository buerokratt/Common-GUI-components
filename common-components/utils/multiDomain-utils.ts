export const getDomainsArray = (currentDomains) => {
    const multiDomainEnabled = import.meta.env.REACT_APP_ENABLE_MULTI_DOMAIN?.toLowerCase() === 'true';
    const userDomains = currentDomains || [];

    return multiDomainEnabled ? (userDomains?.length > 0 ? userDomains : [null]) : [];
}