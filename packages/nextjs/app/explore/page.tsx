import React, { Suspense } from "react";
import ExploreClient from "../../components/explore/ExploreClient";

type Props = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

const ExplorePage = ({ searchParams }: Props) => {
  const q = typeof searchParams?.q === "string" ? searchParams.q : "";
  return (
    <Suspense
      fallback={
        <div className="w-full flex justify-center py-8">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      }
    >
      <ExploreClient initialSearchQuery={q} />
    </Suspense>
  );
};

export default ExplorePage;
