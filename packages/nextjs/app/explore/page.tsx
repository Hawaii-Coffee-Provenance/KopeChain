import React, { Suspense } from "react";
import ExploreClient from "../../components/explore/ExploreClient";

type Props = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

const ExplorePage = async ({ searchParams }: Props) => {
  const resolvedSearchParams = await searchParams;
  const q = typeof resolvedSearchParams?.q === "string" ? resolvedSearchParams.q : "";

  return (
    <Suspense fallback={null}>
      <ExploreClient initialSearchQuery={q} />
    </Suspense>
  );
};

export default ExplorePage;
