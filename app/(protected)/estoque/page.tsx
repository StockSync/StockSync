import { Button } from "@/components/ui/button";
import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { Plus } from "lucide-react";

const EstoquePage = () => {
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Estoque</PageTitle>
          <PageDescription>Organize seu estoque</PageDescription>
        </PageHeaderContent>
        <PageActions>
          <Button>
            <Plus></Plus>
            Adicionar estoque
          </Button>
        </PageActions>
      </PageHeader>
      <PageContent>
        <h1>Estoque</h1>
      </PageContent>
    </PageContainer>
  );
};

export default EstoquePage;
