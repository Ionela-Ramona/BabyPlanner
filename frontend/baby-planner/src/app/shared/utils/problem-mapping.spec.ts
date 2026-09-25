import { HttpErrorResponse } from '@angular/common/http';

import { GENERIC_ERROR_MESSAGE, NETWORK_ERROR_MESSAGE, mapProblemToFields } from './problem-mapping';

describe('mapProblemToFields', () => {
  it('maps PascalCase validation keys to camelCase field errors', () => {
    const result = mapProblemToFields({
      title: 'One or more validation errors occurred.',
      status: 400,
      errors: {
        Name: ['Numele este obligatoriu.'],
        DateOfBirth: ['Data nașterii nu poate fi în viitor.'],
      },
    });

    expect(result.formError).toBeNull();
    expect(result.fieldErrors['name']).toEqual(['Numele este obligatoriu.']);
    expect(result.fieldErrors['dateOfBirth']).toEqual(['Data nașterii nu poate fi în viitor.']);
  });

  it('takes the last segment of a path-shaped key and lowercases it', () => {
    const result = mapProblemToFields({
      errors: {
        '$.occurredAt': ['Data nu este validă.'],
        'request.Name': ['Numele este obligatoriu.'],
      },
    });

    expect(result.fieldErrors['occurredAt']).toEqual(['Data nu este validă.']);
    expect(result.fieldErrors['name']).toEqual(['Numele este obligatoriu.']);
  });

  it('merges messages from different raw keys that normalize to the same field', () => {
    const result = mapProblemToFields({
      errors: {
        Notes: ['Prea multe caractere.'],
        'request.Notes': ['Alt mesaj.'],
      },
    });

    expect(result.fieldErrors['notes']).toEqual(['Prea multe caractere.', 'Alt mesaj.']);
  });

  it('honors an explicit field map over the default normalization', () => {
    const result = mapProblemToFields(
      { errors: { BabyId: ['Bebelușul nu există.'] } },
      { BabyId: 'baby' },
    );

    expect(result.fieldErrors['baby']).toEqual(['Bebelușul nu există.']);
  });

  it('reads detail, falling back to title, for a non-validation problem', () => {
    const withDetail = mapProblemToFields({ title: 'Bad Request', detail: 'Bebelușul nu există.' });
    expect(withDetail.formError).toBe('Bebelușul nu există.');
    expect(withDetail.fieldErrors).toEqual({});

    const withoutDetail = mapProblemToFields({ title: 'Not Found' });
    expect(withoutDetail.formError).toBe('Not Found');
  });

  it('falls back to a generic message for a problem with neither detail nor title', () => {
    const result = mapProblemToFields({ status: 500 });
    expect(result.formError).toBe(GENERIC_ERROR_MESSAGE);
  });

  it('reports the network message for a status-0 HttpErrorResponse', () => {
    const error = new HttpErrorResponse({ status: 0, statusText: 'Unknown Error' });
    const result = mapProblemToFields(error);
    expect(result.formError).toBe(NETWORK_ERROR_MESSAGE);
    expect(result.fieldErrors).toEqual({});
  });

  it('unwraps the body of a validation HttpErrorResponse', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: { errors: { Name: ['Numele este obligatoriu.'] } },
    });

    const result = mapProblemToFields(error);
    expect(result.fieldErrors['name']).toEqual(['Numele este obligatoriu.']);
  });

  it('falls back to the generic message for unrelated input', () => {
    expect(mapProblemToFields(null).formError).toBe(GENERIC_ERROR_MESSAGE);
    expect(mapProblemToFields('boom').formError).toBe(GENERIC_ERROR_MESSAGE);
  });
});
