@if (count($errors) > 0)
    <!-- Form Error List -->
    <div class="uk-alert-danger">
        <strong>おや？ 何かがおかしいようです！</strong>
        <ul>
            @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif
