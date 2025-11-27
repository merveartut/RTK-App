import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const pokemonApi = createApi({
  reducerPath: "pokemonApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://pokeapi.co/api/v2/" }),
  endpoints: (builder) => ({
    getPokemonByName: builder.query<any, string>({
      query: (name) => `pokemon/${name}`,
    }),
    getAllPokemons: builder.query<any, []>({
query: ({ limit = 20, offset = 0 }) => `pokemon?limit=${limit}&offset=${offset}`,
    })
  }),
});



export const { useGetPokemonByNameQuery, useGetAllPokemonsQuery } = pokemonApi;

