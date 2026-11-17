import { useQuery } from '@tanstack/react-query';
import { recordsService } from '../services/records.service';
export function useRecord(id: string) { return useQuery({ queryKey: ['records', id], queryFn: ({ signal }) => recordsService.get(id, signal), enabled: !!id }); }
export function useHobbyCatalog() { return useQuery({ queryKey: ['hobbies'], queryFn: ({ signal }) => recordsService.catalog(signal) }); }
