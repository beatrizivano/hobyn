import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { RegistroFormInput } from '../types/domain';
import { recordsService } from '../services/records.service';
export function useRecord(id: string) { return useQuery({ queryKey: ['records', id], queryFn: ({ signal }) => recordsService.get(id, signal), enabled: !!id }); }
export function useHobbyCatalog() { return useQuery({ queryKey: ['hobbies'], queryFn: ({ signal }) => recordsService.catalog(signal) }); }
export function useCreateRecord() {
  const client = useQueryClient();
  return useMutation({ mutationFn: recordsService.create, onSuccess: async result => {
    client.setQueryData(['records', result.record.id], result.record);
    await client.invalidateQueries({ queryKey: ['records', 'feed', result.record.grupoId] });
  } });
}
export function useUpdateRecord(id: string) {
  const client = useQueryClient();
  return useMutation({ mutationFn: (input: RegistroFormInput) => recordsService.update(id, input), onSuccess: async record => {
    client.setQueryData(['records', id], record);
    await Promise.all([client.invalidateQueries({ queryKey: ['records', 'feed', record.grupoId] }), client.invalidateQueries({ queryKey: ['photos', record.foto] })]);
  } });
}
export function useDeleteRecord() {
  const client = useQueryClient();
  return useMutation({ mutationFn: recordsService.remove, onSuccess: async (_data, id) => {
    client.removeQueries({ queryKey: ['records', id], exact: true });
    client.removeQueries({ queryKey: ['photos', `/api/records/${id}/photo`] });
    await client.invalidateQueries({ queryKey: ['records', 'feed'] });
  } });
}
