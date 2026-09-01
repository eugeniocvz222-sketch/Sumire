import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownViewProps {
  content: string
  className?: string
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content, className = '' }) => {
  return (
    <div className={`markdown-view space-y-3 text-xs leading-relaxed text-slate-200 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-lg font-black text-white mt-3 mb-1.5 flex items-center gap-2 border-b border-purple-500/20 pb-1">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-extrabold text-purple-200 mt-2.5 mb-1 flex items-center gap-1.5">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-bold text-purple-300 mt-2 mb-0.5">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="my-1.5 text-slate-300 leading-relaxed font-normal">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-purple-200 bg-purple-500/10 px-1 py-0.5 rounded">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="text-slate-300 italic font-medium">
              {children}
            </em>
          ),
          ul: ({ children }) => (
            <ul className="my-2 space-y-1 pl-4 list-disc marker:text-purple-400">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 space-y-1 pl-4 list-decimal marker:text-purple-400 font-medium">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-slate-300 text-xs leading-relaxed pl-0.5">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-2.5 pl-3.5 py-1.5 border-l-2 border-purple-500 bg-purple-950/20 rounded-r-xl text-purple-200 italic text-xs">
              {children}
            </blockquote>
          ),
          code: ({ inline, className, children, ...props }: any) => {
            if (inline || !className) {
              return (
                <code
                  className="px-1.5 py-0.5 mx-0.5 rounded-md bg-[#121024] border border-purple-500/30 text-purple-300 font-mono text-[11px] font-semibold"
                  {...props}
                >
                  {children}
                </code>
              )
            }
            return (
              <div className="my-2.5 rounded-xl overflow-hidden border border-white/10 bg-[#06060c]">
                <pre className="p-3 text-[11px] font-mono text-slate-200 overflow-x-auto">
                  <code {...props}>{children}</code>
                </pre>
              </div>
            )
          },
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-xl border border-white/10 bg-[#06060c]">
              <table className="w-full text-left text-xs border-collapse divide-y divide-white/10">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[#121026] text-purple-200 text-[11px] font-bold uppercase tracking-wider">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 border-r border-white/5 last:border-r-0">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 border-r border-white/5 last:border-r-0 text-slate-300">
              {children}
            </td>
          ),
          hr: () => <hr className="my-3 border-purple-500/20" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
