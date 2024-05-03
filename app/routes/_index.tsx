import { json } from '@remix-run/node';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { Form, Link, useLoaderData, useNavigation } from '@remix-run/react';
import { z } from 'zod';
import { zx } from 'zodix';
import { summarizeSearchResults } from '~/services/openai';
import { searchGoogle } from '~/services/serpapi';
import { searchQdrant } from '~/services/vectordb';
import '~/styles/global.css'

export const meta: MetaFunction = () => {
  return [{ title: 'Dexa Coding Interview' }];
};

function Skeleton({ numLines, height }: { numLines: number, height?: number }) {
  return (
    <>
      {Array.from({ length: numLines }, (_, i) => (
        <div key={i} className="animate-pulse bg-gray-200 rounded"
          style={{height: height ? `${height}px` : '15px'}}
        ></div>
      ))}
    </>
  );
}

export async function loader(args: LoaderFunctionArgs) {
  const { q } = zx.parseQuery(args.request, {
    q: z.string().optional(),
  });

  const googleSearchResults = q ? await searchGoogle(q) : null;
  const qdrantSearchResults = q ? await searchQdrant(q) : null;

  const summary = (q && googleSearchResults && qdrantSearchResults) ? await summarizeSearchResults({ 
    query: q, 
    googleSearchResults,
    qdrantSearchResults
  }) : null;


  return json({
    q,
    summary,
    searchResults: googleSearchResults,
    qdrantSearchResults
  })
}

export default function Index() {
  const { q, summary, searchResults, qdrantSearchResults }= useLoaderData<typeof loader>();
  const { state, formData, } = useNavigation();
  const isLoading = state !== 'idle' 
  // Extract the query parameter 'q' from the current URL
  const inputValue = formData?.get('q')?.toString() || q;

  console.log(qdrantSearchResults)


  return (
    <div className="mt-10 p-4 space-y-4 container lg:px-[20%] mb-20">
      <div className="text-3xl font-bold">Welcome to the Dexa coding interview!</div>
        <div className='flex flex-col space-y-4'>
          <Form method="get" className="space-y-4">
            <input
              type="search"
              required
              name="q"
              key={Date.now()}
              autoComplete="off"
              id="search"
              defaultValue={inputValue ?? ''}
              placeholder="Search the web"
              className="w-full border rounded-md p-2"
            />
            <button disabled={isLoading} type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">Search</button>
          </Form>
          {summary || isLoading ? <div className="space-y-2">
            <div className="text-xl font-bold">Answer</div>
            {isLoading ? <Skeleton numLines={8}/> : <p className='whitespace-pre-wrap'>{summary}</p>}
          </div> : null}

          {searchResults || isLoading ? 
          <div>
            <div className="space-y-4">
            <h4 className="text-lg font-bold">Sources</h4>
            {isLoading ? <Skeleton numLines={5} height={50}/> : <ul className='flex flex-col space-y-2'>
              {searchResults?.organic_results.slice(0, 5).map((or: any, i: number) => {
                return (
                  <Link to={or.link} key={or.link} className="bg-gray-100 p-2 rounded-lg hover:cursor-pointer group max-w-3xl overflow-clip">
                    <div className="flex items-center space-x-2 group-hover:text-blue-500">
                      <img src={or.favicon} alt={'source-favicon'} className="w-6 h-6" />
                        <div>{i + 1}.</div>
                        <div className='whitespace-nowrap'>{or.title}</div>
                    </div>
                    {/* <div>{or.snippet}</div> */}
                    <div className='pt-2 text-gray-400 text-xs'>{or.link}</div>
                  </Link>
                );
              })}
            </ul>}
          </div> 

          {qdrantSearchResults || isLoading ? 
          <div className="mt-4">
            <div className="space-y-4">
            <h4 className="text-lg font-bold">Qdrant Results</h4>
            {isLoading ? <Skeleton numLines={5} height={50}/> : <ul className='flex flex-col space-y-2'>
              {qdrantSearchResults?.map((result: any, i: number) => {
                return (
                  <div key={i} className="bg-gray-100 p-2 rounded-lg hover:cursor-pointer group max-w-3xl overflow-clip">
                    <div className="flex items-center space-x-2 group-hover:text-blue-500">
                      <div>{i + 1}.</div>
                      <div className='whitespace-nowrap'>{result.text}</div>
                    </div>
                  </div>
                );
              })}
            </ul>}
          </div> 
          </div> : null}

          <div className="space-y-4 pt-4">
            <h4 className="text-lg font-bold">Related Queries</h4>
            {isLoading ? <Skeleton numLines={4} height={40}/> : <ul className=''>
              {searchResults?.related_questions?.map((rq: any) => {
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
            </ul>}
          </div>
        </div>: null}
      </div>
    </div>
  );
}