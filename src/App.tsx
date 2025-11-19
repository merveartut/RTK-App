import "./App.css";
import { useGetPokemonByNameQuery } from "./services/pokemonApi";

function App() {
  const { data, error, isLoading } = useGetPokemonByNameQuery("ditto");

  if (isLoading) return <div>Loading...</div>;

  if (error) return <div>Error fetching Pokemon</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>{data.name}</h2>
      <img src={data.sprites.front_default} alt={data.name} />
    </div>
  );
}

export default App;
