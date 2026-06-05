export default async function BlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main>
      <h1>Blog Detail</h1>
      <p>Blog ID: {id}</p>
    </main>
  );
}