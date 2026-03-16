import { Skeleton } from "~~/components/Skeleton";

const SKELETON_ROWS = 10;

export const BatchSkeletonRows = () => (
  <>
    {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
      <tr key={i}>
        <td className="px-5 py-4">
          <Skeleton className="h-3 w-24" />
        </td>
        <td className="px-5 py-4">
          <Skeleton className="h-3 w-8" />
        </td>
        <td className="px-5 py-4">
          <Skeleton className="h-3.5 w-24 mb-2" />
          <Skeleton className="h-2.5 w-16" />
        </td>
        <td className="px-5 py-4">
          <Skeleton className="h-3 w-14" />
        </td>
        <td className="px-5 py-4">
          <Skeleton className="h-5 rounded-full w-20" />
        </td>
        <td className="px-5 py-4">
          <Skeleton className="h-3 w-16" />
        </td>
        <td className="px-5 py-4">
          <Skeleton className="h-3 w-24" />
        </td>
        <td className="px-5 py-4">
          <Skeleton className="h-3 w-12" />
        </td>
      </tr>
    ))}
  </>
);
