import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import DeleteButton from '@/components/admin/DeleteButton'
import {fetchPostsFromContentful} from '@/lib/contentfulContentsApi'



export default async function BlogListPage() {
  const posts = await fetchPostsFromContentful();

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white">
          ブログ記事一覧
        </h1>
        <Link href="/admin/blog/new">
          <Button>
            {/* <PlusIcon className="h-5 w-5 mr-1.5 -ml-1" /> */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 -ml-1"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            新規作成
          </Button>
        </Link>
      </div>

      <Card className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                タイトル
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                ステータス
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">
                公開日
              </th>
              <th scope="col" className="relative px-4 py-3">
                <span className="sr-only">編集</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {posts.map((post: { id: string; title: string; status: string; date: string }) => (
              <tr key={post.id}>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{post.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">{post.status} - {post.date}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    post.status === '公開済み' ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100'
                  }`}>
                    {post.status}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
                  {post.date}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Link href={`/admin/blog/${post.id}`} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200">
                    {/* <PencilIcon className="h-5 w-5 inline" /> */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                    <span className="sr-only sm:not-sr-only">編集</span>
                  </Link>
                  <DeleteButton entryId={post.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {posts.length === 0 && (
          <p className="text-center py-8 text-gray-500 dark:text-gray-400">ブログ記事がありません。</p>
        )}
      </Card>
    </div>
  );
}
