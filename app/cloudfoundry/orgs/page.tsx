import Link from 'next/link';
import { getCFOrgs } from '../../../api/cloudfoundry/cloudfoundry';

export default async function CloudFoundryOrgsPage() {
  try {
    const res = await getCFOrgs();
    if (res.status == 'success' && res.body) {
      const orgs = res.body.resources;
      return (
        <>
          <h1>Your CF Organizations</h1>
          <Link href="/cloudfoundry">Back to Cloud Foundry home</Link>
          <ul>
            {orgs.map((org: any) => (
              <li key={org.guid}>
                <Link href={`/cloudfoundry/orgs/${org.guid}`}>{org.name}</Link>
              </li>
            ))}
          </ul>
        </>
      );
    } else {
      return <div role="alert">{res.messages.join(', ')}</div>;
    }
  } catch (error: any) {
    return <div role="alert">{error.message}</div>;
  }
}
