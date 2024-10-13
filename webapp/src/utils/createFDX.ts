export function createFDX(rawText: string): string {
  const fdxTemplate = `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
  <FinalDraft DocumentType="Script" Template="No" Version="1">
    <Content>
      <Paragraph>
        <Text>${rawText}</Text>
      </Paragraph>
    </Content>
  </FinalDraft>`;

  return fdxTemplate;
}
