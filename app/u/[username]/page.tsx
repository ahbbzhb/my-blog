export default async function UserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  return (
    <main>
      <h1>User Profile</h1>
      <p>Username: {username}</p>
    </main>
  );
}