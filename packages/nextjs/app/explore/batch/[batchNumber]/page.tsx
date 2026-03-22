import type { NextPage } from "next";
import BatchPageClient from "~~/components/explore/batch/BatchPageClient";

type PageProps = {
  params: Promise<{ batchNumber: string }>;
};

export function generateStaticParams() {
  return [{ batchNumber: "0" }];
}

const BatchPage: NextPage<PageProps> = async (props: PageProps) => {
  const params = await props.params;
  const batchNumber = params?.batchNumber;

  if (!batchNumber) return null;

  return <BatchPageClient batchNumber={decodeURIComponent(batchNumber)} />;
};

export default BatchPage;
