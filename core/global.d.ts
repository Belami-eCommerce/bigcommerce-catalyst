declare module 'react-instantsearch' {
  export type RefinementListProps = RefinementListProps;
  export type UsePaginationProps = UsePaginationProps;
  export type UseClearRefinementsProps = UseClearRefinementsProps;
  export type UseCurrentRefinementsProps = UseCurrentRefinementsProps;
  export type UseHitsProps = UseHitsProps;
  export function RefinementList(props: RefinementListProps): ReactNode;
  export function ToggleRefinement(props: ToggleRefinementProps): ReactNode;
  export function RangeInput(props: RangeInputProps): ReactNode;
  export function DynamicWidgets(props: DynamicWidgetsProps): ReactNode;
  export function InstantSearch(props: InstantSearchProps): ReactNode;
  export function Configure(props: ConfigureProps): ReactNode;
  export function Hits(props: HitsProps): ReactNode;
  export function HitsPerPage(props: HitsPerPageProps): ReactNode;
  export function Pagination(props: PaginationProps): ReactNode;
  export function SortBy(props: SortByProps): ReactNode;
  export function Stats(props: StatsProps): ReactNode;
  export function Highlight(props: HighlightProps): ReactNode;
  export function RelatedProducts(props: RelatedProductsProps): ReactNode;
  export function LookingSimilar(props: LookingSimilarProps): ReactNode;
  export function useInstantSearch(): ReactNode;
  export function useSearchBox(props: useSearchBoxProps): ReactNode;
  export function usePagination(props: usePaginationProps): ReactNode;
  export function useRefinementList(props: useRefinementListProps): ReactNode;
  export function useClearRefinements(props: useClearRefinementsProps): ReactNode;
  export function useCurrentRefinements(props: useCurrentRefinementsProps, props2: useCurrentRefinementsProps2): ReactNode;
  export function useHits(props: useHitsProps): ReactNode;
  export function useConnector<RatingMenuConnectorParams, RatingMenuWidgetDescription>(props: useConnectorProps, props2: useConnectorProps2): ReactNode;

}

// For Next.js library
declare module 'react-instantsearch-nextjs' {
  export function InstantSearchNext(props: InstantSearchNextProps): ReactNode;
}