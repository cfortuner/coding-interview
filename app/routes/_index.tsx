import { json } from '@remix-run/node';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { Form, Link, useLoaderData } from '@remix-run/react';
import { z } from 'zod';
import { zx } from 'zodix';
import { summarizeSearchResults } from '~/services/openai';
import { searchGoogle } from '~/services/serpapi';
import '~/styles/global.css'

export const meta: MetaFunction = () => {
  return [{ title: 'Dexa Coding Interview' }];
};

export async function loader(args: LoaderFunctionArgs) {
  const { q } = zx.parseQuery(args.request, {
    q: z.string().optional(),
  });
  const searchResults = q ? await searchGoogle(q) : null;
  const summary = q && searchResults ? await summarizeSearchResults({ query: q, searchResults }) : '';
  return json({ q, searchResults, summary });
}

export default function Index() {
  const { q, searchResults, summary } = useLoaderData<typeof loader>();

  return (
    <div className="mt-10 p-4 space-y-4 container lg:px-[20%] mb-20">
      <div className="text-3xl font-bold">Welcome to the Dexa coding interview!</div>
      <Form method="get" className="space-y-4">
        <input
          type="search"
          required
          name="q"
          key={Date.now()}
          autoComplete="off"
          id="search"
          defaultValue={q ?? ''}
          placeholder="Search the web"
          className="w-full border rounded-md p-2"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">Search</button>
      </Form>

      {summary ? (
        <div className="space-y-2">
          <div className="text-xl font-bold">Answer</div>
          <p className='whitespace-pre-wrap'>{summary}</p>
        </div>
      ) : null}

      {searchResults ? (
        <div className="space-y-4">
          <h4 className="text-lg font-bold">Sources</h4>
          <ul className='flex flex-col space-y-2'>
            {searchResults.organic_results.slice(0, 5).map((or, i) => {
              return (
                <a href={or.link} key={or.link} className="bg-gray-100 p-2 rounded-lg hover:cursor-pointer group max-w-3xl overflow-clip">
                  <div className="flex items-center space-x-2 group-hover:text-blue-500">
                    <img src={or.favicon} alt={'source-favicon'} className="w-6 h-6" />
                      <div>{i + 1}.</div>
                      <div className='whitespace-nowrap'>{or.title}</div>
                  </div>
                  {/* <div>{or.snippet}</div> */}
                  <div className='pt-2 text-gray-400 text-xs'>{or.link}</div>
                </a>
              );
            })}
          </ul>
        </div>
      ) : null}

      {searchResults?.related_questions && (
        <div className="space-y-4">
          <h4 className="text-lg font-bold">Related Queries</h4>
          <ul className=''>
            {searchResults.related_questions?.map((rq) => {
              return (
                <Link key={rq.question} to={`?q=${rq.question}`}>
                  <li className="hover:text-blue-500 border-t-[1px] last:border-b-[1px] py-2 text-lg flex justify-between w-full items-center hover:cursor-pointer">
                    <div>
                      {rq.question}
                    </div>
                    <div className='text-2xl font-light text-blue-500'>{"+"}</div>
                  </li>
                </Link>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}