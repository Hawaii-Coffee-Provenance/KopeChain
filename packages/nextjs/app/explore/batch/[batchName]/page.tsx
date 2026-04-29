import type { NextPage } from "next";
import BatchPageClient from "~~/components/explore/batch/BatchPageClient";

type PageProps = {
  params: Promise<{ batchName: string }>;
};

export function generateStaticParams() {
  return [{ batchName: "0" }];
}

const BatchPage: NextPage<PageProps> = async (props: PageProps) => {
  const params = await props.params;
  const batchName = params?.batchName;

  if (!batchName) return null;

  return <BatchPageClient batchName={decodeURIComponent(batchName)} />;
};

export default BatchPage;
