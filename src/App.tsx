import { useState } from "react";
import "./App.css";
import { useGetAllPokemonsQuery, useGetPokemonByNameQuery } from "./services/pokemonApi";

function App() {
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchedPokemon, setSearchedPokemon] = useState("pikachu");
  
  // --- PAGINATION STATE ---
  const [page, setPage] = useState(1);
  const limit = 24; // Sayfa başına 24 pokemon (Grid için güzel sayı)
  const offset = (page - 1) * limit;

  // --- QUERIES ---
  // Tekil arama
  const { 
    data: pokemonData, 
    error: pokemonError, 
    isLoading: pokemonIsLoading 
  } = useGetPokemonByNameQuery(searchedPokemon, { skip: selectedTab !== "single" });

  // Çoklu liste (Parametreleri gönderiyoruz)
  const { 
    data: allData, 
    error: allError, 
    isLoading: allLoading,
    isFetching: allFetching // Sayfa değişirken loading göstermek için
  } = useGetAllPokemonsQuery({ limit, offset }, { skip: selectedTab !== "all" });

  // --- HELPER FUNCTION: URL'den ID çıkarma ---
  // PokeAPI listede resim dönmez, ID'yi url'den alıp resmi biz oluşturacağız.
  // Url örneği: "https://pokeapi.co/api/v2/pokemon/1/"
  const getPokemonIdFromUrl = (url) => {
    const parts = url.split("/");
    return parts[parts.length - 2]; // Sondan bir önceki parça ID'dir
  };

  return (
    <div style={{ padding: 20, fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", width: "100%", margin: "0 auto" }}>
      
      {/* --- TAB BUTONLARI --- */}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 30 }}>
        <button
          onClick={() => setSelectedTab("all")}
          style={getButtonStyle(selectedTab === "all")}
        >
          Tüm Pokemonlar
        </button>
        <button
          onClick={() => setSelectedTab("single")}
          style={getButtonStyle(selectedTab === "single")}
        >
          İsme Göre Ara
        </button>
      </div>

      <hr style={{ opacity: 0.2, marginBottom: 30 }} />

      {/* --- TÜM POKEMONLAR (GRID GÖRÜNÜMÜ) --- */}
      {selectedTab === "all" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3>Pokemon Koleksiyonu (Sayfa: {page})</h3>
            
            {/* Pagination Kontrolleri */}
            <div>
              <button 
                disabled={page === 1 || allFetching} 
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={paginationBtnStyle}
              >
                &lt; Önceki
              </button>
              <button 
                disabled={!allData?.next || allFetching} 
                onClick={() => setPage((p) => p + 1)}
                style={paginationBtnStyle}
              >
                Sonraki &gt;
              </button>
            </div>
          </div>

          {(allLoading || allFetching) && <div style={{textAlign: "center", padding: 20}}>Yükleniyor...</div>}
          {allError && <p style={{ color: "red" }}>Veri çekilirken hata oluştu.</p>}

          {/* GRID CONTAINER */}
          <div style={{
            display: "grid",
gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: "20px"
          }}>
            {allData && allData.results.map((poke) => {
              const id = getPokemonIdFromUrl(poke.url);
              const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

              return (
                <div key={poke.name} style={cardStyle}>
                  <div style={imgContainerStyle}>
                    <img
                      src={imageUrl}
                      alt={poke.name}
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      loading="lazy"
                    />
                  </div>
                  <h4 style={{ textTransform: "capitalize", margin: "10px 0 0 0", color: "#333" }}>
                    {poke.name}
                  </h4>
                  <span style={{ fontSize: "12px", color: "#888" }}>#{id}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- TEKİL ARAMA (ESKİ KODUN AYNI YAPISI) --- */}
      {selectedTab === "single" && (
        <div style={{ textAlign: "center" }}>
          <h3>Detaylı Pokemon Arama</h3>
          <div style={{ marginBottom: 20 }}>
            <input
              type="text"
              value={searchedPokemon}
              onChange={(e) => setSearchedPokemon(e.target.value.toLowerCase())}
              placeholder="Pokemon ismi (örn: charizard)"
              style={inputStyle}
            />
          </div>

          {pokemonIsLoading && <p>Aranıyor...</p>}
          {pokemonError && <p style={{ color: "red" }}>Pokemon bulunamadı!</p>}

          {pokemonData && (
            <div style={detailCardStyle}>
              <h2 style={{ textTransform: "capitalize", margin: 0 }}>{pokemonData.name}</h2>
              <img
                src={pokemonData.sprites.other["official-artwork"].front_default}
                alt={pokemonData.name}
                style={{ width: 200, margin: "20px 0" }}
              />
              <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>
                <div style={statBoxStyle}>
                  <strong>Boy</strong>
                  <div>{pokemonData.height / 10} m</div>
                </div>
                <div style={statBoxStyle}>
                  <strong>Kilo</strong>
                  <div>{pokemonData.weight / 10} kg</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- BASİT STYLES (Inline CSS Objects) ---
// Not: Gerçek projede CSS Modules veya styled-components kullanmak daha iyidir.

const getButtonStyle = (isActive) => ({
  padding: "10px 20px",
  cursor: "pointer",
  backgroundColor: isActive ? "#ffcb05" : "#f0f0f0",
  color: isActive ? "#2a75bb" : "#333",
  border: "none",
  borderRadius: "5px",
  fontWeight: "bold",
  fontSize: "16px",
  boxShadow: isActive ? "0 2px 5px rgba(0,0,0,0.2)" : "none",
  transition: "all 0.2s"
});

const paginationBtnStyle = {
  padding: "8px 16px",
  marginLeft: "10px",
  cursor: "pointer",
  backgroundColor: "#2a75bb",
  color: "white",
  border: "none",
  borderRadius: "4px"
};

const cardStyle = {
  backgroundColor: "white",
  borderRadius: "15px",
  padding: "15px",
  textAlign: "center",
  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
  transition: "transform 0.2s",
  cursor: "pointer",
  border: "1px solid #eee"
};

const imgContainerStyle = {
  width: "100%",
  height: "120px",
  backgroundColor: "#f8f9fa",
  borderRadius: "10px",
  padding: "10px",
  boxSizing: "border-box"
};

const inputStyle = {
  padding: "12px",
  width: "300px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "16px"
};

const detailCardStyle = {
  backgroundColor: "white",
  border: "1px solid #eee",
  padding: "40px",
  borderRadius: "20px",
  display: "inline-block",
  boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
};

const statBoxStyle = {
  backgroundColor: "#f5f5f5",
  padding: "10px 20px",
  borderRadius: "8px"
};

export default App;