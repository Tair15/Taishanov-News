import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Article {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export interface NewsResponse {
  status: string;
  totalResults: number;
  articles: Article[];
}

export const newsApi = createApi({
  reducerPath: 'newsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://newsapi.org/v2' }),
  endpoints: (builder) => ({
    getTopHeadlines: builder.query<NewsResponse, { country?: string; page?: number }>({
      query: ({ country = 'us', page = 1 }) => {
        const apiKey = process.env.EXPO_PUBLIC_NEWS_API_KEY || 'demo';
        return `/top-headlines?country=${country}&page=${page}&pageSize=20&apiKey=${apiKey}`;
      },
    }),
    searchNews: builder.query<NewsResponse, { query: string; page?: number }>({
      query: ({ query, page = 1 }) => {
        const apiKey = process.env.EXPO_PUBLIC_NEWS_API_KEY || 'demo';
        return `/everything?q=${query}&page=${page}&pageSize=20&sortBy=publishedAt&apiKey=${apiKey}`;
      },
    }),
  }),
});

export const { useGetTopHeadlinesQuery, useSearchNewsQuery } = newsApi;