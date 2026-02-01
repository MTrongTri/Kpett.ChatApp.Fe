export default function HomePage() {

  console.log("API URL " + process.env.NEXT_PUBLIC_API_URL)

  return <h1 className="text-xl font-semibold">Home Feed</h1>
}
