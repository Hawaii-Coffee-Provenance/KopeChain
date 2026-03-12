const SKELETON_ROWS = 5;

export const BatchSkeletonRows = () => (
  <>
    {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
      <tr key={i}>
        <td className="px-5 py-4">
          <div className="h-3 bg-base-300 rounded animate-pulse w-24" />
        </td>
        <td className="px-5 py-4">
          <div className="h-3.5 bg-base-300 rounded animate-pulse w-24 mb-2" />
          <div className="h-2.5 bg-base-300 rounded animate-pulse w-16" />
        </td>
        <td className="px-5 py-4">
          <div className="h-3 bg-base-300 rounded animate-pulse w-14" />
        </td>
        <td className="px-5 py-4">
          <div className="h-5 bg-base-300 rounded-full animate-pulse w-20" />
        </td>
        <td className="px-5 py-4">
          <div className="h-3 bg-base-300 rounded animate-pulse w-16" />
        </td>
        <td className="px-5 py-4">
          <div className="h-3 bg-base-300 rounded animate-pulse w-24" />
        </td>
        <td className="px-5 py-4">
          <div className="h-3 bg-base-300 rounded animate-pulse w-12" />
        </td>
      </tr>
    ))}
  </>
);
