import { logger } from '@common/logger';
import type { Client } from '@notionhq/client';
import { isFullBlock, isFullPage } from '@notionhq/client';
import type { CheckboxPropertyItemObjectResponse, DatePropertyItemObjectResponse, Heading1BlockObjectResponse, MultiSelectPropertyItemObjectResponse, PageObjectResponse, ParagraphBlockObjectResponse, RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints';
import type { IPostContent, IPostInfo, IPostRepository, PostContentFactory, PostFilter, PostInfoFactory } from '@posts/types';

export class NotionRepository implements IPostRepository {
  constructor(
    private client: Client,
    private postInfoFactory: PostInfoFactory,
    private postContentFactory: PostContentFactory,
    private databaseId: string,
  ) {}

  async getPosts(postFilter: PostFilter): Promise<IPostInfo[]> {
    const query = {
      database_id: this.databaseId,
      filter: {
        and: parseFilter(postFilter),
      },
    };

    const page = await this.client.databases.query(query);
    return page.results.map((result) => {
      if (!isFullPage(result)) throw new Error('Result is not full page');

      return parseNotionProps<IPostInfo>(
        result,
        [
          { propName: 'Title', outputField: 'title' },
          { propName: 'Published', outputField: 'published' },
          { propName: 'Tags', outputField: 'tags' },
          { propName: 'Id', outputField: 'id' },
          { propName: 'Date', outputField: 'date' },
          { propName: 'Slug', outputField: 'slug' },
          { propName: 'Tweet', outputField: 'tweet' },
          { propName: 'ImageURL', outputField: 'imageUrl' },
          { propName: 'ImageAlt', outputField: 'imageAlt' },
        ],
        this.postInfoFactory({}),
      );
    });
  }

  async getPostContent(postID: string): Promise<IPostContent[] | null> {
    const pageID = await this.getPageID(postID);

    if (!pageID) return null;

    const response = await this.client.blocks.children.list({
      block_id: pageID,
    });

    const postBodyList: IPostContent[] = [];

    return response.results.reduce((list, result) => {
      if (!isFullBlock(result)) throw new Error('Result is not full block');

      if (isHeading1Block(result)) {
        list.push(this.postContentFactory({ heading: parseHeading1Block(result) }));
      } else if (isParagraphBlock(result)) {
        list.push(this.postContentFactory({ paragraph: parseParagraphBlock(result) }));
      } else {
        logger.error(`Unknown block type: ${result.type}`);
      }

      return list;
    }, postBodyList);
  }

  private async getPageID(postID: string): Promise<string | null> {
    const query = {
      database_id: this.databaseId,
      filter: {
        and: [
          {
            property: 'Id',
            rich_text: {
              equals: postID,
            },
          },
        ],
      },
    };

    const page = await this.client.databases.query(query);
    if (page.results.length === 0 || page.results.length > 1) return null;

    const pageID = page.results[0].id;

    return pageID;
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

    let parsedProp: boolean | string | string[] | Date;

    if (isCheckboxProp(prop)) parsedProp = parseCheckboxProp(prop);
    else if (isTitleProp(prop)) parsedProp = parseTitleProp(prop);
    else if (isMultiselectProp(prop)) parsedProp = parseMultiselectProp(prop);
    else if (isRichTextProduct(prop)) parsedProp = parseRichTextProp(prop);
    else if (isDateProp(prop)) parsedProp = parseDateProp(prop);
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

function isRichTextProduct(prop: Record<string, any>): prop is { rich_text: RichTextItemResponse[] } {
  return prop.type === 'rich_text';
}

function isDateProp(prop: Record<string, any>): prop is DatePropertyItemObjectResponse {
  return prop.type === 'date';
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

function parseRichTextProp(prop: { rich_text: RichTextItemResponse[] }): string {
  return prop.rich_text[0].plain_text;
}

function parseDateProp(prop: DatePropertyItemObjectResponse): Date {
  const dateString = prop.date?.start;
  if (!dateString) throw new Error('Date prop is empty');
  return new Date(dateString);
}

function isHeading1Block(block: Record<string, any>): block is Heading1BlockObjectResponse {
  return block.type === 'heading_1';
}

function isParagraphBlock(block: Record<string, any>): block is ParagraphBlockObjectResponse {
  return block.type === 'paragraph';
}

function parseHeading1Block(block: Heading1BlockObjectResponse): string {
  return block.heading_1.rich_text[0]?.plain_text || '';
}

function parseParagraphBlock(block: ParagraphBlockObjectResponse): string {
  return block.paragraph.rich_text[0]?.plain_text || '';
}
