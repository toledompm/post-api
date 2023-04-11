import { IPost, IPostRepository, PostFilter } from '@posts/types';
import { Client, isFullPage } from '@notionhq/client';
import { CheckboxPropertyItemObjectResponse, MultiSelectPropertyItemObjectResponse, PageObjectResponse, RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints';

export class NotionRepository implements IPostRepository {
  constructor(
    private client: Client,
    private postFactory: (props: Partial<IPost>) => IPost,
    private databaseId: string,
  ) {}

  async getPosts(postFilter: PostFilter): Promise<IPost[]> {
    const query = {
      database_id: this.databaseId,
      filter: {
        and: parseFilter(postFilter),
      },
    };

    const page = await this.client.databases.query(query);
    const posts = page.results.map((result) => {
      if (!isFullPage(result)) throw new Error('Result is not full page');

      const post = parseNotionProps<IPost>(
        result,
        [
          { propName: 'Title', outputField: 'title' },
          { propName: 'Published', outputField: 'published' },
          { propName: 'Tags', outputField: 'tags' },
        ],
        this.postFactory({}),
      );

      return {
        ...post,
        id: result.id,
        body: 'string',
        date: new Date(),
      };
    });

    return posts;
  }
}

const parseFilter = (filter: PostFilter) => {
  const filters = [];

  filters.push({
    property: 'Published',
    checkbox: {
      equals: filter.published,
    },
  });

  filter.tags.forEach((tag) => {
    filters.push({
      property: 'Tags',
      multi_select: {
        contains: tag,
      },
    });
  });

  return filters;
};

function parseNotionProps<T>(notionResponse: PageObjectResponse, props: { propName: string, outputField: keyof T }[], target: T): T {
  return props.reduce((acc, { propName, outputField }) => {
    const prop = notionResponse.properties[propName];
    if (!prop) return acc;

    let parsedProp: boolean | string | string[];

    if (isCheckboxProp(prop)) parsedProp = parseCheckboxProp(prop);
    else if (isTitleProp(prop)) parsedProp = parseTitleProp(prop);
    else if (isMultiselectProp(prop)) parsedProp = parseMultiselectProp(prop);
    else throw new Error(`Unknown prop type: ${prop.type}`);

    return {
      ...acc,
      [outputField]: parsedProp,
    };
  }, target);
}

function isCheckboxProp(prop: Record<string, any>): prop is CheckboxPropertyItemObjectResponse {
  return prop.type === 'checkbox';
}

function isTitleProp(prop: Record<string, any>): prop is { title: RichTextItemResponse[] } {
  return prop.type === 'title';
}

function isMultiselectProp(prop: Record<string, any>): prop is MultiSelectPropertyItemObjectResponse {
  return prop.type === 'multi_select';
}

function parseCheckboxProp(prop: CheckboxPropertyItemObjectResponse): boolean {
  return prop.checkbox;
}

function parseTitleProp(prop: { title: RichTextItemResponse[] }): string {
  return prop.title[0].plain_text;
}

function parseMultiselectProp(prop: MultiSelectPropertyItemObjectResponse): string[] {
  return prop.multi_select.map(option => option.name);
}
