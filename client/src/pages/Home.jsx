import Counter from "../components/Counter";

function Home() {
  return (
    <section className="min-h-screen bg-gradient-to-tr from-indigo-100 to-blue-50 flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-5xl md:text-6xl font-bold text-indigo-700 mb-4">
        Welcome to MyApp 👋
      </h1>
      <p className="text-lg md:text-xl text-gray-600 max-w-2xl">
        A minimal, elegant frontend boilerplate built with React, TailwindCSS & React Router.
      </p>
      <Counter />
    </section>
  );
}

export default Home